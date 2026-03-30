Docker-based monitoring stack runbook
- Overview: Prometheus + cadvisor + node_exporter + Alertmanager + Grafana
- Access:
  - Grafana: http://<server>:3000 (default admin/admin)
- Prometheus: http://<server>:9090
- Alertmanager: http://<server>:9093
- Slack integration requires setting SLACK_WEBHOOK_URL for Alertmanager

Deployment:
- Use docker-compose up -d on Ubuntu 22.04 server. Ensure Docker is installed.
- For CI/CD, see GitHub Actions workflow in .github/workflows/deploy.yml (example).

Operator notes:
- Edit prometheus.yml to adjust scrape targets if needed.
- Populate Slack webhook and update alertmanager config accordingly.
- Import Grafana dashboard from grafana/dashboards/containers.json or via API.

