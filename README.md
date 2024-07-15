# ChatWebapp

Entwicklung einer P2P-basierten Chat-Webanwendung mit Next.js und Docker.

## Kurzbeschreibung

Dieses Projekt zielt darauf ab, eine Chat-Webanwendung zu entwickeln, die Peer-to-Peer-Kommunikation unterstützt. Die Anwendung ermöglicht normale Chats sowie Gruppenchats mit zusätzlicher Unterstützung für anonyme Kommunikation. Die Implementierung erfolgt mithilfe von Next.js und Docker.

## Features

- **User Accounts:** Benutzer können Konten erstellen und sich anmelden.
- **Normaler Chat:** Einzelne Benutzer können miteinander chatten.
- **Gruppenchat:** Mehrere Benutzer können in einem gemeinsamen Chatraum kommunizieren.
- **Anonymer Chat:** Option für anonyme Kommunikation zwischen Benutzern.
- **(Videoanruf):** Gegebenenfalls wird die Unterstützung für Videoanrufe implementiert.

## Installation und Ausführung

Um die Webanwendung in einer Docker-Umgebung auszuführen, folge diesen Schritten:

1. Stelle sicher, dass Docker auf deinem System installiert ist.

2. Navigiere in das Root-Verzeichnis des Projekts.

3. Führe den folgenden Befehl aus, um die Webanwendung mit Docker Compose zu starten:

   ```bash
   docker-compose up
