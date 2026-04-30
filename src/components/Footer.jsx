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
              Магазин смартфонов и аксессуаров Xiaomi. Гарантия, быстрая доставка, лучшие цены.
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
            <a className="footer-link" href="#">Доставка и самовывоз</a>
            <a className="footer-link" href="#">Способы оплаты</a>
            <a className="footer-link" href="#">Гарантия и сервис</a>
            <a className="footer-link" href="#">Возврат и обмен</a>
            <a className="footer-link" href="#">Кредит и рассрочка</a>
            <a className="footer-link" href="#">Бонусная программа</a>
            <a className="footer-link" href="#">Подарочные сертификаты</a>
            <a className="footer-link" href="#">Корпоративным клиентам</a>
            <a className="footer-link" href="#">Часто задаваемые вопросы</a>
            <a className="footer-link" href="#">Политика конфиденциальности</a>
            <a className="footer-link" href="#">Договор оферты</a>
          </div>

          <div>
            <h4 className="footer-col-title">Контакты</h4>
            <a className="footer-link" href="tel:+78005553535">+7 (800) 555-35-35</a>
            <a className="footer-link" href="mailto:info@voltix.ru">info@voltix.ru</a>
            <a className="footer-link" href="#">Время работы: 9:00–21:00</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2024 Voltix. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
