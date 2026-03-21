import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { IconContext } from "react-icons";
import './Navbar.css'
import { SidebarData } from "./SidebarData";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebar(!sidebar);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      navigate("/");
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return (
    <IconContext.Provider value={{ color: "#fff" }}>
      {/* Top Navbar */}
      <div className="navbar">
        <button className="menu-bars" onClick={toggleSidebar}>
          <FaIcons.FaBars />
        </button>

        <h2 className="header-name">JHAY GADGET</h2>
      </div>

      {/* Sidebar */}
      <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
        <ul className="nav-menu-items">
          {/* Close button */}
          <li className="navbar-toggle">
            <button className="menu-bars" onClick={toggleSidebar}>
              <AiIcons.AiOutlineClose />
            </button>
          </li>

          {/* Menu Items */}
          {SidebarData.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <li
                key={index}
                className={`nav-text ${isActive ? "active" : ""}`}
              >
                <Link to={item.path} onClick={() => setSidebar(false)}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}

          {/* Logout */}
          <li className="nav-text">
            <button className="logout-btn" onClick={handleLogout}>
              <FaIcons.FaSignOutAlt />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </IconContext.Provider>
  );
}

export default Navbar;