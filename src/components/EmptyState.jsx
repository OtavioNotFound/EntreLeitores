export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="estado-vazio">
      {icon && <span className="estado-vazio__icone">{icon}</span>}
      <strong>{title}</strong>
      {description && <p className="estado-vazio__texto">{description}</p>}
      {action}
    </div>
  );
}
