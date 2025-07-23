import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventosLayout from "./layouts/EventosLayout";
import Evento from "./pages/Evento";
import FormsEvento from "./pages/FormsEvento";
import { Analytics } from '@vercel/analytics/react';
import { CalendarProvider } from "./context/CalendarContext";
import EventoAberto from "./pages/EventoAberto";
import MiddlewareEventos from "./middleware/MiddlewareEventos";

function App() {
  useEffect(() => {
    MiddlewareEventos.obterTodasCategorias();
  }, []);
  return (
    <CalendarProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota aninhada usando um layout compartilhado */}
          <Route path="/" element={<EventosLayout />}>
            {/* Rota índice mostra a lista de eventos */}
            <Route index element={<Evento />} />
            {/* Rota para evento específico - compartilha o mesmo layout */}
            <Route path="evento/:id" element={<EventoAberto />} />
          </Route>
          {/* Essa rota permanece independente */}
          <Route path="/adicionar-evento" element={<FormsEvento />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </CalendarProvider>
  );
}

export default App;