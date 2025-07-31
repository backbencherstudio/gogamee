import React from 'react'
import BookPage from './page'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <body className="antialiased">



        <div className='w-full max-w-[1200px] mx-auto'>    
            <div className='w-full'>

                
                {children}
            </div>
        </div>



      </body>
 
    </html>
  )
}
