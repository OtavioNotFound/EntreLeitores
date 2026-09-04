import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, AutoStories as BookPagesIcon, ShieldOutlined as ShieldIcon, BookmarkAddedOutlined as SavedIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { applyAutomaticStreakProtections, getPlatformSettings, getReadingSessions, getStreakProtections } from '../services/social.js';
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
  const [settings, setSettings] = useState({ streak_days_displayed:30, streak_max_protections:5, streak_renewal:'monthly' });
  const [lostStreak, setLostStreak] = useState(false);

  useEffect(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12);
    const daysAgo = Math.max(35, Math.ceil((Date.now() - first.getTime()) / 86400000) + 2);
    setLoading(true);
    Promise.all([applyAutomaticStreakProtections(), getReadingSessions(user.id, daysAgo), getStreakProtections(user.id), getPlatformSettings()]).then(([, readingSessions, savedProtections, platformSettings]) => {
      setSessions(readingSessions);
      setProtections(savedProtections);
      setSettings(platformSettings);
    }).catch((error) => mostrarToast(error.message)).finally(() => setLoading(false));
  }, [monthDate, user.id]);

  const calendar = useMemo(() => buildMonthlyStreakCalendar(sessions, protections, monthDate), [sessions, protections, monthDate]);
  const monthPrefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  const usedThisMonth = protections.filter((item) => item.protected_on.startsWith(monthPrefix)).length;
  const remaining = Math.max(0, Number(settings.streak_max_protections) - usedThisMonth);
  const streak = calculateReadingStreak(sessions, new Date(), protections);
  const isCurrentMonth = monthDate.getMonth() === new Date().getMonth() && monthDate.getFullYear() === new Date().getFullYear();

  useEffect(() => {
    const key = `ofensiva-anterior:${user.id}`;
    const previous = Number(localStorage.getItem(key) || 0);
    if (previous > 0 && streak === 0) setLostStreak(true);
    localStorage.setItem(key, String(streak));
  }, [streak, user.id]);

  function changeMonth(offset) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
  }

  return <section className="pagina ativa ofensiva-pagina">
    <div className="pagina-cabecalho"><div><h1 className="pagina-cabecalho__titulo">Ofensiva de livros</h1><p className="pagina-cabecalho__sub">Acompanhe seus dias de leitura e proteja sua sequência quando precisar.</p></div></div>
    {lostStreak && <div className="ofensiva-alerta" role="status"><BookPagesIcon /><div><strong>Sua sequência foi interrompida.</strong><span>Uma nova página começa hoje — registre uma leitura para iniciar outra ofensiva.</span></div><button onClick={() => setLostStreak(false)} aria-label="Fechar aviso">×</button></div>}
    <div className="ofensiva-resumo">
      <article className="widget ofensiva-resumo__card ofensiva-resumo__card--fogo"><BookPagesIcon /><div><strong>{streak}</strong><span>{streak === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}</span></div></article>
      <article className="widget ofensiva-resumo__card"><ShieldIcon /><div><strong>{remaining} de {settings.streak_max_protections}</strong><span>proteções automáticas disponíveis em {monthFormatter.format(monthDate)}</span></div></article>
    </div>
    <section className="widget ofensiva-calendario">
      <header><button className="ofensiva-calendario__nav" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft /></button><h2>{monthFormatter.format(monthDate)}</h2><button className="ofensiva-calendario__nav" onClick={() => changeMonth(1)} disabled={isCurrentMonth} aria-label="Próximo mês"><ChevronRight /></button></header>
      <div className="ofensiva-calendario__grade">
        {WEEKDAYS.map((weekday) => <span className="ofensiva-calendario__semana" key={weekday}>{weekday}</span>)}
        {Array.from({ length: calendar.firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}
        {calendar.days.map((day) => <button key={day.date} className={`ofensiva-dia ofensiva-dia--${day.status}${day.today ? ' hoje' : ''}`} disabled title={day.status === 'read' ? 'Leitura registrada' : day.status === 'protected' ? 'Dia protegido automaticamente' : day.status === 'saved' ? 'Proteção guardada' : day.status === 'missed' ? 'Sem leitura registrada' : 'Dia futuro'}><span>{day.day}</span>{day.status === 'read' ? <BookPagesIcon /> : day.status === 'protected' ? <ShieldIcon /> : day.status === 'saved' ? <SavedIcon /> : null}</button>)}
      </div>
      <div className="ofensiva-legenda"><span><i className="lido" />Leitura feita</span><span><i className="protegido" />Proteção usada</span><span><i className="guardado" />Proteção guardada</span><span><i className="perdido" />Sem leitura</span></div>
      <p className="ofensiva-ajuda">As proteções são aplicadas automaticamente aos dias perdidos, até o limite de {settings.streak_max_protections} por mês. O calendário exibe {settings.streak_days_displayed} dias conforme a configuração da plataforma.</p>
    </section>
  </section>;
}
