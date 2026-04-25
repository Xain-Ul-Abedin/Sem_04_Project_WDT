import React from 'react'

const Button = ({ title, id, rightIcon, leftIcon, containerClass, accentColor = '#bbf7d0', onClick }) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full border border-white/20 px-7 py-3 transition-colors duration-300 ease-in-out hover:border-transparent ${containerClass}`}
    >
      {/* Ink Drop Hover Effect */}
      <div
        className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform duration-500 ease-in-out group-hover:scale-100"
        style={{ backgroundColor: accentColor }}
      />

      {/* Button Content */}
      <span className="relative z-20 flex items-center justify-center gap-2 font-general text-xs uppercase text-black">
        {leftIcon}
        <span className='relative inline-flex overflow-hidden'>
          <div>
            {title}
          </div>
        </span>
        {rightIcon}
      </span>
    </button>
  )
}

export default Button