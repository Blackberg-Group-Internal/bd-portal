import NotificationsIcon from '../../../../../public/images/icons/notifications.svg';
import SettingsIcon from '../../../../../public/images/icons/settings.svg';
import Link from 'next/link';

const UserMenu = ({ photo }) => {

  return (
    <div className="dropdown mt-auto menu-user position-relative align-items-center px-3 d-flex flex-column">
      {/* <Link href="/notifications" className="p-2">
        <NotificationsIcon className="icon" />
      </Link>
      <Link href="/settings" className="mt-2 p-2">
        <SettingsIcon className="icon" />
      </Link> */}
      <Link href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle mt-4">
        {photo ? (
          <div className="px-1">
            <img src={photo} alt="User Profile" className="img-fluid" />
          </div>
        ) : (
          <div className="avatar-placeholder"></div>
        )}
      </Link>
    </div>
  );
};

export default UserMenu;
