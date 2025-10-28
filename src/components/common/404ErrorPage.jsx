import React from 'react';

const Error404Page = ({ onRetry, showReload = true }) => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e5e7eb 100%)',
                padding: '24px',
            }}
        >
            <style>
                {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulseSoft {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          .card {
            width: 100%;
            max-width: 560px;
            background: rgba(255,255,255,0.8);
            border: 1px solid rgba(0,0,0,0.06);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 16px;
            padding: 28px;
            color: #1e293b;
            backdrop-filter: blur(8px);
          }
          .iconwrap {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: linear-gradient(135deg, #AD3B10 0%, #F97316 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(173,59,16,0.3);
            box-shadow: 0 10px 25px rgba(173,59,16,0.25);
            margin: 0 auto 16px;
            animation: float 3s ease-in-out infinite;
          }
            .title {
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            position: relative;
            color: #AD3B10;
            overflow: hidden;
            }

          .title::after {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: shine 2.5s infinite;
            }

            @keyframes shine {
            100% { left: 100%; }
            }

          .subtitle {
            font-size: 14px;
            color: #475569;
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.5;
          }
          .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
          .btn {
            appearance: none;
            border: 0;
            cursor: pointer;
            border-radius: 10px;
            padding: 10px 16px;
            font-weight: 600;
            transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .primary {
            color: white;
            background: linear-gradient(135deg, #AD3B10 0%, #F97316 100%);
            box-shadow: 0 8px 18px rgba(173,59,16,0.35);
          }
          .primary:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(173,59,16,0.45); }
          .primary:active { transform: translateY(0px) scale(0.99); }
          .secondary {
            color: #1e293b;
            background: rgba(229,231,235,0.4);
            border: 1px solid rgba(0,0,0,0.1);
          }
          .secondary:hover { transform: translateY(-1px); }
          .muted {
            font-size: 12px;
            color: #64748b;
            text-align: center;
            margin-top: 14px;
            animation: pulseSoft 2.4s ease-in-out infinite;
          }
        `}
            </style>

            <div className="card">
                <div className="iconwrap">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M9 21h6a7 7 0 000-14 5 5 0 00-9.8 2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M7 17a3 3 0 004 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="title">Server Not Reachable</div>
                <div className="subtitle">Please check your internet connection or try again in a moment.</div>

                <div className="actions">
                    <button className="btn primary" onClick={onRetry}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M21 12a9 9 0 10-3.52 7.09" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M21 12v6h-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Retry
                    </button>

                    {showReload && (
                        <button className="btn secondary" onClick={() => window.location.reload()}>
                            Reload
                        </button>
                    )}
                </div>

                <div className="muted">Error code: 404 · Connectivity issue</div>
            </div>
        </div>
    );
};

export default Error404Page;