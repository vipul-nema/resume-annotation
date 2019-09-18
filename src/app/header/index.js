import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class Header extends Component {
    render() {
        return (
            <>
                <NavLink className="app-nav-link"
                    to="/upload"
                    activeStyle={{
                        fontWeight: "bold",
                        color: "red"
                    }}
                >
                    Upload
          </NavLink>
                <NavLink className="app-nav-link"
                    to="/list"
                    activeStyle={{
                        fontWeight: "bold",
                        color: "red"
                    }}
                >
                    List
          </NavLink>

            </>
        );
    }
}

export default Header;