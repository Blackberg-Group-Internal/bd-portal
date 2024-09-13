const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer position-absolute bottom-0 p-4">
            <div className="container">
                <span>Footer</span>
            </div>
        </footer>
    )
}

export default Footer;