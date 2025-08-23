import rankings from '../../../data/rankings.sample.json';

export async function GET() {
  return Response.json(rankings);
}
