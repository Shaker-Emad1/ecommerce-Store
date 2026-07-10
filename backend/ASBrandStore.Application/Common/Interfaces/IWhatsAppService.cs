using System.Threading.Tasks;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IWhatsAppService
{
    Task SendMessageAsync(string toPhoneNumber, string message);
    Task SendOrderNotificationAsync(Order order);
}
