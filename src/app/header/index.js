import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';

class Header extends PureComponent {
    render() {
        return (
            <>
                <NavLink className="app-nav-link"
                    to="/upload"
                > Upload
          </NavLink>
                <NavLink className="app-nav-link"
                    to="/list"
                >List
          </NavLink>

            </>
        );
    }
}

export default Header;