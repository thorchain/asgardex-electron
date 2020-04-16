import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Connect.css';

export default function ConnectWallet() {
  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <div className={styles.container} data-tid="connect">
        <h1>CONNECT</h1>
        <h2>WALLET</h2>
      </div>
    </div>
  );
}
