import {
    AppBar,
    Box,
    Typography,
    Button,
    ButtonGroup,
} from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import logoImg from '../assets/logo.jpg'
import "../css/header.css"
import { useAuth } from "../routes/AuthContext";
import { useEffect } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const HeaderTabs = () => {
    const {isLoggedIn} = useAuth();
    const tabs = [
        { url: "/", text: "Home" },
        { url: "/track", text: "Track Shipment" },
        { url: "/about", text: "About Us" },
        { url: "/faq", text: "FAQ" },
        isLoggedIn ? { url: "/user/order/all", text: "Dashboard" } : { url: "/auth/login", text: "Login" },
    ]
    return (
        <ButtonGroup sx={{ textDecoration: "none", marginRight: 1 }}>
            {tabs.map((item, index) => (
                <NavLink key={index} className="navlink" to={item.url}>
                    <Button className="header-button" style={{border:'none', outline: 'none'}}color='inherit'>{item.text}</Button>
                </NavLink>
            ))}
        </ButtonGroup>
    );
};


const Header = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/api/auth/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Auth check failed');
            }

            const data = await response.json();
            setIsLoggedIn(true);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
        }
    };

    // Add debug function
    const debugStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Current token:', token);

            const response = await fetch(`${BASE_URL}/api/auth/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Status Response:', data);
            console.log('Response OK:', response.ok);
            console.log('Response Status:', response.status);
        } catch (error) {
            console.error('Debug Status Error:', error);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <div className="header-box">
            <AppBar
                sx={{
                    backgroundColor: "rgb(29, 53, 87)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 2,
                        minHeight: "60px",
                    }}
                >
                    <Link style={{ textDecoration: "none", display: "flex", alignItems: "center" }} to="/">
                        <img src={logoImg} height='50px' alt="logo" />
                    </Link>
                    {/* Add debug button */}
                    <Button 
                        onClick={debugStatus}
                        sx={{ 
                            ml: 2, 
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)'
                            }
                        }}
                    >
                        Debug Status
                    </Button>
                </Box>
                <HeaderTabs />
            </AppBar>
        </div>
    );
};

export default Header;