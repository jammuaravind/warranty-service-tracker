export default function StatCard({ label, value, icon, tone = 'primary' }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-${tone}`}>{icon}</span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
