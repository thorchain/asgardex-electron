import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home() {
  return (
    <div className={styles.container} data-tid="container">
      <h1>ASGARD</h1>
      <h2>WALLET</h2>
      <Link to={routes.CONNECT}>Connect Wallet</Link>
    </div>
  );
}
