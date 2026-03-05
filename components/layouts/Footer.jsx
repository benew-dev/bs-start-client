import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container max-w-[1440px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-orange-400">
              Buy It Now
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Votre destination pour le shopping en ligne de qualité. Découvrez
              notre vaste sélection de produits à des prix compétitifs.
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/me"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Mon compte
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Panier
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Nous contacter
            </h3>
            <address className="text-gray-300 text-sm not-italic space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-orange-400">📧</span>
                Email: contact@buyitnow.com
              </p>
              <p className="flex items-center gap-2">
                <span className="text-pink-400">📞</span>
                Téléphone: +33 1 23 45 67 89
              </p>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Buy It Now. Tous droits réservés.
            <span className="ml-2 text-orange-400 font-semibold">
              Made with ❤️
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
