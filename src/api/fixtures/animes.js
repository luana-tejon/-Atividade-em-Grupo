export const ANIMES_FIXTOS = [
  {
    id: 1,
    titulo: 'Cowboy Bebop',
    capa: 'https://cdn.myanimelist.net/images/anime/4/19644l.jpg',
    ano: 1998,
    avaliacao: 8.74,
    diretor: 'Watanabe, Shinichirou',
    sinopse:
      'Um grupo de caçadores de recompensas viaja pelo sistema solar no ano de 2071.',
    ondeAssistir: [
      {
        nome: 'Crunchyroll',
        url: 'https://www.crunchyroll.com/',
      },
      {
        nome: 'Netflix',
        url: 'https://www.netflix.com/',
      },
    ],
  },
  {
    id: 5114,
    titulo: 'Fullmetal Alchemist: Brotherhood',
    capa: 'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg',
    ano: 2009,
    avaliacao: 9.1,
    diretor: null,
    sinopse:
      'Dois irmãos usam alquimia para tentar recuperar o que perderam.',
    ondeAssistir: [
      {
        nome: 'Crunchyroll',
        url: 'https://www.crunchyroll.com/',
      },
    ],
  },
  {
    id: 16498,
    titulo: 'Attack on Titan',
    capa: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    ano: 2013,
    avaliacao: 8.5,
    diretor: 'Araki, Tetsurou',
    sinopse:
      'A humanidade sobrevive atrás de muralhas contra titãs gigantes.',
    ondeAssistir: [],
  },
  {
    id: 999,
    titulo: 'Anime de Exemplo sem Metadados',
    capa: '',
    ano: null,
    avaliacao: null,
    diretor: null,
    sinopse: null,
    ondeAssistir: [],
  },
]

export function obterAnimeFixo(id) {
  const numero = Number(id)
  return ANIMES_FIXTOS.find((anime) => anime.id === numero) ?? null
}
