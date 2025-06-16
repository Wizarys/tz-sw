import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
            <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0 }}>
                <li>
                    <Link to="/">Форма</Link>
                </li>
                <li>
                    <Link to="/users">Пользователи</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;