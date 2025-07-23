import React from "react";

const Footer = () => {

    return (
        <div className="w-full bg-secondary border-t border-gray-200 py-6">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
                <span className="text-gray-600 text-sm mb-2 md:mb-0">
                    © {new Date().getFullYear()} Minha Cidade. Todos os direitos reservados.
                </span>
                <a
                    href="https://www.instagram.com/minha_cidadeapp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-pink-600 transition-colors"
                >
                    <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.75a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5zm0 1.5a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5zm5.25 1.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                    Instagram
                </a>
            </div>
        </div>)
};


export default Footer;