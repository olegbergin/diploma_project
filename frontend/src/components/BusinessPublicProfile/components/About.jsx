import React from 'react';
import styles from './About.module.css';

const About = ({ business }) => {
    return (
        <div className={styles.aboutContainer}>
            <h2>About Us</h2>
            <p>{business.description}</p>
        </div>
    );
};

export default About;
