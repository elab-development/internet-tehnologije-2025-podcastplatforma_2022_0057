export type Episode = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export const popularEpisodes: Episode[] = [
  {
    id: "1",
    title: "Podcast 064: Jovan Memedović",
    description: "Jovan Memedović je legenda televizijskog programa na našim prostorima. Sa više od trideset godina karijere koja se proteže od legendarnih prenosa bokserskih mečeva, preko nekih od najgledanijih kvizova, pa sve do svojih autorskih emisija, kao što je emisija Sasvim prirodno, Memedović je stekao kultni status među mnogim generacijama. U jednom od veoma retkih pojavljivanja van svojih televizijskih formata, razgovarali smo o njegovom stvaralaštvu, životu, televiziji i mnogim drugim temama. ",
    image: "/popularEpisodes/episode1.jpg"
  },
  {
    id: "2",
    title: "Podcast 049: Miloš Milaković",
    description: "Miloš Milaković je komičar, scenarista i glumac amater, najpoznatiji po projektu Dnevnjak i po svom youtube kanalu.",
    image: "/popularEpisodes/episode2.jpg"
  },
  {
    id: "3",
    title: "Podcast 139: Ivan Ivanović",
    description: "Ivan Ivanović je jedan od naših najpoznatijih televizijskih voditelja i autora. Njegova emisija, „Veče sa Ivanom Ivanovićem”, je pored brojnih rekorda gledanosti, zapravo, prvi „late night” format koji je zaista uspeo u Srbiji. Pored same dugovečnosti projekta, Ivanović je poznat i po beskompromisnim i polarizujućim stavovima, od kritike vlasti do poslovnih odluka, zbog kojih je često u centru pažnje. Pored toga, nosilac je brojnih drugih poznatih televizijskih projekata, poput kviza „Stolice”. O samom televizijskom poslu, evoluciji medija, politici i životu uopšte, u novoj epizodi.",
    image: "/popularEpisodes/episode3.jpg"
  }
];
