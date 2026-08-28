import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LocalFireDepartment as FireIcon, ShieldOutlined as ShieldIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { getReadingSessions, getStreakProtections, useStreakProtection } from '../services/social.js';
import { buildMonthlyStreakCalendar, calculateReadingStreak } from '../lib/readerIntelligence.js';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Ofensiva() {
  const { user } = useAuth();
  const mostrarToast = useToast();
  const [monthDate, setMonthDate] = useState(() => { const date = new Date(); date.setDate(1); return date; });
  const [sessions, setSessions] = useState([]);
  const [protections, setProtections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [protecting, setProtecting] = useState('');

  useEffect(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12);
    const daysAgo = Math.max(35, Math.ceil((Date.now() - first.getTime()) / 86400000) + 2);
    setLoading(true);
    Promise.all([
      getReadingSessions(user.id, daysAgo),
      getStreakProtections(user.id),
    ]).then(([readingSessions, savedProtections]) => {
      setSessions(readingSessions);
      setProtections(savedProtections);
    }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [monthDate, user.id]);

  const calendar = useMemo(() => buildMonthlyStreakCalendar(sessions, protections, monthDate), [sessions, protections, monthDate]);
  const monthPrefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  const usedThisMonth = protections.filter((item) => item.protected_on.startsWith(monthPrefix)).length;
  const remaining = Math.max(0, 5 - usedThisMonth);
  const streak = calculateReadingStreak(sessions, new Date(), protections);
  const isCurrentMonth = monthDate.getMonth() === new Date().getMonth() && monthDate.getFullYear() === new Date().getFullYear();

  async function protect(day) {
    if (remaining === 0 || day.status !== 'missed') return;
    setProtecting(day.date);
    try {
      const protection = await useStreakProtection(user.id, day.date);
      setProtections((current) => [...current, protection]);
      mostrarToast('Dia protegido. Sua ofensiva continua segura!');
    } catch (error) { mostrarToast(error.message.includes('five protections') ? 'Você já usou as 5 proteções deste mês.' : error.message); }
    finally { setProtecting(''); }
  }

  function changeMonth(offset) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
  }

  return <section className="pagina ativa ofensiva-pagina">
    <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Ofensiva de livros</h1><p className="pagina-cabecalho__sub">Acompanhe seus dias de leitura e proteja sua sequência quando precisar.</p></div></div>
    <div className="ofensiva-resumo">
      <article className="widget ofensiva-resumo__card ofensiva-resumo__card--fogo"><FireIcon /><div><strong>{streak}</strong><span>{streak === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}</span></div></article>
      <article className="widget ofensiva-resumo__card"><ShieldIcon /><div><strong>{remaining} de 5</strong><span>proteções disponíveis em {monthFormatter.format(monthDate)}</span></div></article>
    </div>
    <section className="widget ofensiva-calendario">
      <header><button className="ofensiva-calendario__nav" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft /></button><h2>{monthFormatter.format(monthDate)}</h2><button className="ofensiva-calendario__nav" onClick={() => changeMonth(1)} disabled={isCurrentMonth} aria-label="Próximo mês"><ChevronRight /></button></header>
      <div className="ofensiva-calendario__grade">
        {WEEKDAYS.map((weekday) => <span className="ofensiva-calendario__semana" key={weekday}>{weekday}</span>)}
        {Array.from({ length: calendar.firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}
        {calendar.days.map((day) => <button key={day.date} className={`ofensiva-dia ofensiva-dia--${day.status}${day.today ? ' hoje' : ''}`} disabled={day.status !== 'missed' || remaining === 0 || Boolean(protecting)} onClick={() => protect(day)} title={day.status === 'read' ? 'Leitura registrada' : day.status === 'protected' ? 'Dia protegido' : day.status === 'missed' ? 'Sem leitura — clique para usar uma proteção' : 'Dia futuro'}><span>{day.day}</span>{day.status === 'read' ? <FireIcon /> : day.status === 'protected' ? <ShieldIcon /> : null}</button>)}
      </div>
      <div className="ofensiva-legenda"><span><i className="lido" />Leitura feita</span><span><i className="protegido" />Proteção usada</span><span><i className="perdido" />Sem leitura</span></div>
      <p className="ofensiva-ajuda">Clique em um dia sem leitura para gastar uma proteção. O saldo volta automaticamente para 5 no início de cada mês.</p>
    </section>
  </section>;
}
