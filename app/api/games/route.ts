import games from '../../../data/games.sample.json';

export async function GET() {
  return Response.json(games);
}
