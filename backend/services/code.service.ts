import { connectToDatabase } from "@/backend";
import { Code } from "@/backend/models";

export interface CodeValidationResult {
  valid: boolean;
  message: string;
  code?: any;
  discountAmount?: number;
  finalTotal?: number;
}

const normalizeCode = (code: string) => code.trim().toUpperCase();

const generateSegment = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase();

class CodeService {
  async list() {
    await connectToDatabase();
    return Code.find({}).sort({ createdAt: -1 }).lean();
  }

  async getById(id: string) {
    await connectToDatabase();
    return Code.findById(id).lean();
  }

  async getByCode(code: string) {
    await connectToDatabase();
    return Code.findOne({ code: normalizeCode(code) });
  }

  async create(data: any) {
    await connectToDatabase();
    const payload = {
      ...data,
      code: normalizeCode(data.code || this.generateGiftCode()),
    };
    const created = await Code.create(payload);
    return created.toObject();
  }

  async update(id: string, data: any) {
    await connectToDatabase();
    const payload = { ...data };
    if (payload.code) payload.code = normalizeCode(payload.code);
    return Code.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async delete(id: string) {
    await connectToDatabase();
    return Code.findByIdAndDelete(id).lean();
  }

  generateGiftCode() {
    return `GOGAME-${generateSegment()}-${generateSegment()}`;
  }

  calculateDiscount(code: any, orderTotal: number) {
    const safeTotal = Math.max(0, Number(orderTotal) || 0);
    if (safeTotal <= 0) return 0;

    if (code.codeKind === "gift") {
      return Math.min(safeTotal, Number(code.remainingAmount) || 0);
    }

    if (code.discountType === "percentage") {
      return Math.min(safeTotal, safeTotal * ((Number(code.value) || 0) / 100));
    }

    return Math.min(safeTotal, Number(code.value) || 0);
  }

  async validate(codeInput: string, orderTotal: number): Promise<CodeValidationResult> {
    if (!codeInput?.trim()) {
      return { valid: false, message: "Introduce un codigo valido." };
    }

    const code = await this.getByCode(codeInput);
    if (!code) {
      return { valid: false, message: "El codigo no existe." };
    }

    if (!code.isActive) {
      return { valid: false, message: "El codigo no esta activo." };
    }
    if (code.state === "banned") {
      return { valid: false, message: "Este codigo esta bloqueado." };
    }
    if (code.state === "suspended") {
      return { valid: false, message: "Este codigo esta suspendido." };
    }

    if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) {
      return { valid: false, message: "El codigo ha caducado." };
    }

    if (code.codeKind === "gift" && code.paymentStatus !== "paid") {
      return { valid: false, message: "La tarjeta regalo aun no esta disponible." };
    }

    if (code.codeKind === "gift" && (code.remainingAmount || 0) <= 0) {
      return { valid: false, message: "La tarjeta regalo no tiene saldo." };
    }

    if (code.usageLimit === "single" && code.usedCount >= 1) {
      return { valid: false, message: "El codigo ya fue utilizado." };
    }

    if (
      code.usageLimit === "multiple" &&
      code.maxUses &&
      code.usedCount >= code.maxUses
    ) {
      return { valid: false, message: "El codigo alcanzo su limite de uso." };
    }

    const discountAmount = this.calculateDiscount(code, orderTotal);
    if (discountAmount <= 0) {
      return { valid: false, message: "El codigo no aplica a este importe." };
    }

    return {
      valid: true,
      message: "Codigo aplicado.",
      code: code.toObject ? code.toObject() : code,
      discountAmount,
      finalTotal: Math.max(0, orderTotal - discountAmount),
    };
  }

  async redeem(
    codeId: string,
    discountAmount: number,
    context?: {
      source?: "booking" | "manual";
      bookingId?: string;
      bookingReference?: string;
      note?: string;
    },
  ) {
    await connectToDatabase();
    const code = await Code.findById(codeId);
    if (!code) return null;
    const previousRemainingAmount = Number(code.remainingAmount || 0);

    code.usedCount += 1;
    code.lastUsedAt = new Date();

    if (code.codeKind === "gift") {
      code.usageLogs = code.usageLogs || [];
      code.usageLogs.push({
        usedAt: new Date(),
        amount: discountAmount,
        source: context?.source || "booking",
        bookingId: context?.bookingId,
        bookingReference: context?.bookingReference,
        note: context?.note,
      });

      code.remainingAmount = Math.max(
        0,
        (Number(code.remainingAmount) || 0) - discountAmount,
      );
      if (code.remainingAmount <= 0) {
        code.isActive = false;
        code.state = "suspended";
      }
    } else if (code.usageLimit === "single") {
      code.isActive = false;
    } else if (
      code.usageLimit === "multiple" &&
      code.maxUses &&
      code.usedCount >= code.maxUses
    ) {
      code.isActive = false;
    }

    await code.save();
    const updated = code.toObject();
    return {
      ...updated,
      _redemption: {
        previousRemainingAmount,
        usedAmount: discountAmount,
        remainingAmount: Number(updated.remainingAmount || 0),
        usedAt: code.lastUsedAt,
        source: context?.source || "booking",
        bookingId: context?.bookingId,
        bookingReference: context?.bookingReference,
      },
    };
  }

  async markGiftPaid(id: string, paymentIntentId: string) {
    return this.update(id, {
      isActive: true,
      state: "active",
      paymentStatus: "paid",
      stripePaymentIntentId: paymentIntentId,
    });
  }

  async markGiftFailed(id: string) {
    return this.update(id, {
      isActive: false,
      state: "suspended",
      paymentStatus: "failed",
    });
  }
}

export const codeService = new CodeService();
