'use client'
import * as React from "react";
import { useRouter } from 'next/navigation';

interface Notification {
  idNotification: number;
  title: string;
  message: string;
}

type NotificationSvgProps = {
  notifications: Notification[];
} & React.SVGProps<SVGSVGElement>;

const NotificationSvg: React.FC<NotificationSvgProps> = ({ notifications, ...props }) => {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [localNotifications, setLocalNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    if (localNotifications.length === 0 && notifications.length > 0) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://185.237.207.78:5000/api/Notification/${id}/mark-as-read`, {
        method: 'POST',
      });
      setLocalNotifications(prev => prev.filter(n => n.idNotification !== id));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        localNotifications.map(noti =>
          fetch(`http://185.237.207.78:5000/api/Notification/${noti.idNotification}/mark-as-read`, {
            method: 'POST',
          })
        )
      );
      setLocalNotifications([]);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNoti = async (id: number) => {
    try {
      await fetch(`http://185.237.207.78:5000/api/Notification/${id}`, {
        method: 'DELETE',
      });
      setLocalNotifications(prev => prev.filter(n => n.idNotification !== id));
    } catch (error) {
      console.error("Error: ", error)
    }
  }


  const handleNotificationClick = async (id: number) => {
    await markAsRead(id);
    router.push('/catalogue');
  };

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

        {localNotifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {localNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 shadow-lg rounded-md z-10 text-base flex flex-col h-[520px]">
          <header className="flex justify-center items-center relative p-2 border-b border-gray-200">
            <h1 className="font-medium">Повідомлення</h1>
            {localNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="absolute right-4 text-green-600 hover:text-green-800"
                title="Позначити всі як прочитані"
              >
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23.228 8.01785C23.6186 7.62741 23.6187 6.99424 23.2283 6.60363L22.5213 5.89638C22.1309 5.50577 21.4977 5.50563 21.1071 5.89607L10.0862 16.9122C9.69563 17.3027 9.6955 17.9359 10.0859 18.3265L10.7929 19.0337C11.1833 19.4243 11.8165 19.4245 12.2071 19.034L23.228 8.01785Z"
                    fill="#000000"
                  />
                  <path
                    d="M17.2285 8.01777C17.619 7.62724 17.619 6.99408 17.2285 6.60356L16.5214 5.89645C16.1309 5.50592 15.4977 5.50592 15.1072 5.89645L5.54542 15.4582L2.76773 12.6805C2.37721 12.29 1.74404 12.29 1.35352 12.6805L0.646409 13.3876C0.255884 13.7782 0.255885 14.4113 0.646409 14.8019L4.83831 18.9938C5.22883 19.3843 5.862 19.3843 6.25252 18.9938L17.2285 8.01777Z"
                    fill="#000000"
                  />
                </svg>
              </button>
            )}
          </header>

          <ul className="divide-y divide-gray-200 overflow-auto flex-1">
            {localNotifications.map((noti) => (
              <li
                key={noti.idNotification}
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-start"
                onClick={() => handleNotificationClick(noti.idNotification)}
              >
                <div>
                  <div className="font-medium text-gray-900">{noti.title}</div>
                  <div className="text-gray-600 text-sm">{noti.message}</div>
                </div>

                <div className="flex flex-column">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(noti.idNotification);
                    }}
                    className="ml-4 text-green-600 hover:text-green-800"
                    title="Позначити як прочитане"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNoti(noti.idNotification);
                    }}
                    className="ml-4 text-green-600 hover:text-green-800"
                    title="Видалити"
                  >
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      {...props}
                    >
                      <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                        <g id="Shape" fill="#000000" transform="translate(64.000000, 42.666667)">
                          <path d="M256,42.6666667 L128,42.6666667 L128,7.10542736e-15 L256,7.10542736e-15 L256,42.6666667 Z M170.666667,170.666667 L128,170.666667 L128,341.333333 L170.666667,341.333333 L170.666667,170.666667 Z M256,170.666667 L213.333333,170.666667 L213.333333,341.333333 L256,341.333333 L256,170.666667 Z M384,85.3333333 L384,128 L341.333333,128 L341.333333,426.666667 L42.6666667,426.666667 L42.6666667,128 L0,128 L0,85.3333333 L384,85.3333333 Z M298.666667,128 L85.3333333,128 L85.3333333,384 L298.666667,384 L298.666667,128 Z" />
                        </g>
                      </g>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
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