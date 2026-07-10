using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
