import Link from 'next/link';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';
// import Logo from '../../assets/images/logo.svg';

export default function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${styles.header}`} >
      <Link href="/">
        <div className="logo">
          <img src="/images/logo.svg" alt="logo" />
        </div>
      </Link>
    </header>
  )
}
