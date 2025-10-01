      const result = stmt.run(
        monitorData.name,
        monitorData.url,
        monitorData.type || 'http',
        monitorData.interval_seconds || 60,
        monitorData.timeout_seconds || 30,
        monitorData.is_active !== undefined ? (monitorData.is_active ? 1 : 0) : 1
      );