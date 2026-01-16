// src/pages/Dashboard.jsx

// =====================================================
// DASHBOARD PAGE - Estadísticas y Analytics
// =====================================================

import { useState, useEffect } from 'react';
import { useSocket, SOCKET_EVENTS } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
// CORRECCIÓN 1: Importar desde '../components' para evitar error de ruta
import { Spinner, EmptyState } from '../components'; 
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  Star,
  Clock,
} from 'lucide-react';
import './Dashboard.css';

export default function DashboardPage() {
  const { subscribe, connectedAgents, whatsappStatus } = useSocket();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [realtimeStats, setRealtimeStats] = useState(null);
  const [trend, setTrend] = useState(null);

  // Cargar datos
  const loadData = async () => {
    try {
      const [analyticsData, statsData, trendData] = await Promise.all([
        api.getSurveyAnalytics().catch(() => null),
        api.getRealtimeStats().catch(() => null),
        api.getSurveyTrend(7).catch(() => null),
      ]);

      setAnalytics(analyticsData);
      setRealtimeStats(statsData);
      setTrend(trendData);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      showError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cargar al montar
  useEffect(() => {
    loadData();
  }, []);

  // Escuchar actualizaciones de encuestas
  useEffect(() => {
    const unsub = subscribe(SOCKET_EVENTS.DASHBOARD_SURVEY_UPDATE, loadData);
    return () => unsub && unsub();
  }, [subscribe]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="lg" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  const stats = realtimeStats || {};
  const counts = stats.counts || {};
  const percentages = stats.percentages || {};

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen de actividad y encuestas</p>
        </div>
        <button 
          className="btn-outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{connectedAgents.length}</span>
            <span className="stat-label">Agentes conectados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${whatsappStatus === 'connected' ? 'success' : 'error'}`}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {whatsappStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
            <span className="stat-label">WhatsApp</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <BarChart3 size={24} />
          </div>
          <div className="stat-info">
            {/* CORRECCIÓN 2: Asegurar que sea número */}
            <span className="stat-value">{Number(stats.total || 0)}</span>
            <span className="stat-label">Total encuestas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Star size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{Number(stats.averageRating || 0).toFixed(1)}</span>
            <span className="stat-label">Rating promedio</span>
          </div>
        </div>
      </div>

      {/* Survey Results */}
      <div className="card survey-section">
        <h2>Resultados de Encuestas</h2>
        
        <div className="survey-grid">
          <div className="survey-card excellent">
            <div className="survey-header">
              <ThumbsUp size={20} />
              <span>Excelente</span>
            </div>
            <div className="survey-count">{counts.EXCELENTE || 0}</div>
            <div className="survey-bar">
              <div 
                className="survey-fill"
                style={{ width: `${percentages.EXCELENTE || 0}%` }}
              />
            </div>
            <span className="survey-percent">{Number(percentages.EXCELENTE || 0).toFixed(1)}%</span>
          </div>

          <div className="survey-card regular">
            <div className="survey-header">
              <Minus size={20} />
              <span>Regular</span>
            </div>
            <div className="survey-count">{counts.REGULAR || 0}</div>
            <div className="survey-bar">
              <div 
                className="survey-fill"
                style={{ width: `${percentages.REGULAR || 0}%` }}
              />
            </div>
            <span className="survey-percent">{Number(percentages.REGULAR || 0).toFixed(1)}%</span>
          </div>

          <div className="survey-card bad">
            <div className="survey-header">
              <ThumbsDown size={20} />
              <span>Mala</span>
            </div>
            <div className="survey-count">{counts.MALA || 0}</div>
            <div className="survey-bar">
              <div 
                className="survey-fill"
                style={{ width: `${percentages.MALA || 0}%` }}
              />
            </div>
            <span className="survey-percent">{Number(percentages.MALA || 0).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Trend */}
      {trend?.data && trend.data.length > 0 && (
        <div className="card trend-section">
          <h2>
            <TrendingUp size={20} />
            Tendencia últimos 7 días
          </h2>
          
          <div className="trend-chart">
            {trend.data.map((day, i) => {
              // CORRECCIÓN 3: Convertir a números explícitamente
              const exc = Number(day.EXCELENTE || 0);
              const reg = Number(day.REGULAR || 0);
              const bad = Number(day.MALA || 0);

              // CORRECCIÓN 4: Altura Absoluta
              // Usamos Math.min para que cada voto sume altura (ej. 10px) 
              // hasta un tope de 60px. Así se ve volumen real.
              
              return (
                <div key={i} className="trend-day">
                  <div className="trend-bars">
                    <div 
                      className="trend-bar excellent"
                      // Si hay 1 voto, altura 10px. Si hay 6, altura 60px (tope).
                      style={{ height: `${Math.min(exc * 10, 60)}px` }}
                      title={`Excelente: ${exc}`}
                    />
                    <div 
                      className="trend-bar regular"
                      style={{ height: `${Math.min(reg * 10, 60)}px` }}
                      title={`Regular: ${reg}`}
                    />
                    <div 
                      className="trend-bar bad"
                      style={{ height: `${Math.min(bad * 10, 60)}px` }}
                      title={`Mala: ${bad}`}
                    />
                  </div>
                  <span className="trend-label">
                    {/* CORRECCIÓN 5: Arreglo de Zona Horaria agregando T00:00:00 */}
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="trend-legend">
            <span><span className="dot excellent"></span> Excelente</span>
            <span><span className="dot regular"></span> Regular</span>
            <span><span className="dot bad"></span> Mala</span>
          </div>
        </div>
      )}

      {/* Connected Agents */}
      {connectedAgents.length > 0 && (
        <div className="card agents-section">
          <h2>Agentes Conectados</h2>
          <div className="agents-grid">
            {connectedAgents.map((agent, i) => (
              <div key={i} className="agent-card">
                <div className="agent-avatar">
                  {agent.firstName?.[0] || agent.email?.[0] || 'A'}
                </div>
                <div className="agent-info">
                  <span className="agent-name">
                    {agent.firstName} {agent.lastName}
                  </span>
                  <span className="agent-role">{agent.role}</span>
                </div>
                <span className="agent-status">
                  <span className="status-dot online"></span>
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {analytics?.comments?.length > 0 && (
        <div className="card comments-section">
          <h2>Comentarios Recientes</h2>
          <div className="comments-list">
            {analytics.comments.slice(0, 5).map((comment, i) => (
              <div key={i} className="comment-item">
                <span className={`comment-badge ${comment.rating.toLowerCase()}`}>
                  {comment.rating === 'EXCELENTE' && <ThumbsUp size={12} />}
                  {comment.rating === 'REGULAR' && <Minus size={12} />}
                  {comment.rating === 'MALA' && <ThumbsDown size={12} />}
                  {comment.rating}
                </span>
                <p>{comment.comment}</p>
                <span className="comment-date">
                  <Clock size={12} />
                  {new Date(comment.createdAt).toLocaleDateString('es', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}