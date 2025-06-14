import * as React from "react";

type Notification = {
  noti_name: string;
};

type NotificationSvgProps = {
  notifications: Notification[];
} & React.SVGProps<SVGSVGElement>;

const NotificationSvg: React.FC<NotificationSvgProps> = ({ notifications, ...props }) => {
  const count = notifications.length;
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 
               14.158V11a6.002 6.002 0 00-4-5.659V4a2 
               2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 
               11v3.159c0 .538-.214 1.055-.595 
               1.436L4 17h5m6 0v1a3 3 0 
               11-6 0v-1m6 0H9"
          />
        </svg>

        {count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 shadow-lg rounded-md z-10 text-base flex flex-col h-[520px]">
          <ul className="divide-y divide-gray-200 overflow-auto flex-1">
            {count > 0 ? (
              notifications.map((noti, index) => (
                <li key={index} className="px-5 py-3 hover:bg-gray-50">
                  {noti.noti_name}
                </li>
              ))
            ) : (
              <li className="px-5 py-6 text-center text-gray-500">Нема нових повідомлень</li>
            )}
          </ul>
          <div className="border-t border-gray-200 text-center">
            <button
              type="button"
              className="w-full px-4 py-3 text-blue-600 hover:bg-gray-50 font-medium"
            >
              Показати всі повідомлення
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationSvg;
