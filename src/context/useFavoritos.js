import { createContext, useContext } from 'react'

// Separado do Provider para manter o Fast Refresh funcionando
// (regra react/only-export-components).
export const FavoritosContexto = createContext(null)

export function useFavoritos() {
  const valor = useContext(FavoritosContexto)
  if (!valor) {
    throw new Error('useFavoritos precisa estar dentro de <FavoritosProvider>.')
  }
  return valor
}
