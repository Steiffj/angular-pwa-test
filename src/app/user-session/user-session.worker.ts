/// <reference lib="DOM" />

const rxs: MessagePort[] = []; // TODO track which data each rx is interested in.

onconnect = (e) => {
  const port = e.ports[0];
  rxs.push(port);
  console.log(port);
  console.log(`User session is tracking ${rxs.length} clients`);

  port.onmessage = (e) => {
    const msg = e.data;
    // TODO only post data to the rx if configured to do so. Default to a warning/uninitialized message otherwise.
    for (const rx of rxs) {
      rx.postMessage(msg);
    }
  };
};
