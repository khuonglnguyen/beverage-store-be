export class BaseService {
  async formatData(status: number, body: any) {
    return { status, body };
  }
}
