import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          TXD
        </Link>
        <div className="nav-actions">
          <button className="nav-lang">VN</button>
          <button className="nav-menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}
