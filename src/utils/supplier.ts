export async function sendOrderToSupplier(serviceId: string, link: string, quantity: number) {
  const apiKey = process.env.SUPPLIER_API_KEY;
  const apiUrl = process.env.SUPPLIER_API_URL;

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}&action=add&service=${serviceId}&link=${link}&quantity=${quantity}`, {
      method: 'POST',
    });

    const data = await response.json();
    return data; // شامل order ID تامین‌کننده
  } catch (error) {
    console.error("Supplier API Error:", error);
    return { error: "Failed to connect to supplier" };
  }
}