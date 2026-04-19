import { Link } from 'react-router-dom';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo">
              <div className="logo-icon">⚡</div>
              <div className="logo-text">Vol<span>tix</span></div>
            </Link>
            <p className="footer-brand-desc">
              Официальный магазин смартфонов и аксессуаров Xiaomi. Гарантия, быстрая доставка, лучшие цены.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Каталог</h4>
            <Link className="footer-link" to="/catalog/smartphones">Смартфоны</Link>
            <Link className="footer-link" to="/catalog/cases">Чехлы</Link>
            <Link className="footer-link" to="/catalog/glass">Защитные стёкла</Link>
            <Link className="footer-link" to="/catalog/earphones">Наушники</Link>
          </div>

          <div>
            <h4 className="footer-col-title">Покупателям</h4>
            <a className="footer-link" href="#">Доставка</a>
            <a className="footer-link" href="#">Оплата</a>
            <a className="footer-link" href="#">Гарантия</a>
            <a className="footer-link" href="#">Возврат</a>
          </div>

          <div>
            <h4 className="footer-col-title">Контакты</h4>
            <a className="footer-link" href="#">+7 (800) 555-35-35</a>
            <a className="footer-link" href="#">info@voltix.ru</a>
            <a className="footer-link" href="#">Москва, ул. Тверская 12</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2024 Voltix. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
