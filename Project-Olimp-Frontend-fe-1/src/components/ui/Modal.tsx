import clsx from 'clsx';
import React from 'react';

const defaultContentClassName = 'p-6 sm:p-7 min-w-0';
const safePaddingClassPattern = /(?:^|\s)p[trblxy]?-(?:[4-9]|[1-9][0-9]|\[)/;

const hasSafePadding = (className?: string) => {
  return typeof className === 'string' && safePaddingClassPattern.test(className);
};

const withDefaultPadding = (children: React.ReactNode) => {
  const childNodes = React.Children.toArray(children);

  if (childNodes.length !== 1) {
    return <div className={defaultContentClassName}>{children}</div>;
  }

  const child = childNodes[0];

  if (
    !React.isValidElement<{ className?: string }>(child) ||
    child.type === React.Fragment ||
    typeof child.type !== 'string'
  ) {
    return <div className={defaultContentClassName}>{children}</div>;
  }

  if (hasSafePadding(child.props.className)) {
    return child;
  }

  return React.cloneElement(child, {
    className: clsx(child.props.className, defaultContentClassName),
  });
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  classSize = 'max-w-lg' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  children: React.ReactNode, 
  classSize?: string 
}) => {
  if (!isOpen) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={clsx("bg-white rounded-[32px] shadow-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden", classSize)}
      >
        {withDefaultPadding(children)}
      </div>
    </div>
  )
}
