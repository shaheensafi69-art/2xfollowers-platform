// src/services/smmService.ts
export const SmmService = {
  async placeOrder(serviceId: number, link: string, quantity: number) {
    const response = await fetch(`${process.env.SUPPLIER_API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: process.env.SUPPLIER_API_KEY,
        action: 'add',
        service: serviceId,
        link,
        quantity
      }),
    });
    return response.json();
  }
};