import logo from "../assets/MinhaCidade-Logotipo.png";

export default function Header() {
    const navigateToHome = () => {
        window.location.href = '/';
    };

    return (
        <header
            className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4"
            onClick={navigateToHome}
            style={{ cursor: 'pointer' }}
        >
            <div className="flex items-center w-full relative">
                <img src={logo} alt="Logo" className="w-10 h-10 absolute left-0" />
                <div className="mx-auto text-[#260d33] text-lg font-bold">
                    Minha Cidade - Eventos
                </div>
            </div>
        </header>
    );
}
