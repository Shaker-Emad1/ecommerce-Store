using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ASBrandStore.Application.Common.Interfaces;
using ASBrandStore.Application.DTOs;
using ASBrandStore.Domain.Entities;

namespace ASBrandStore.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public AuthService(IApplicationDbContext context, IJwtTokenGenerator tokenGenerator)
    {
        _context = context;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (existingUser)
        {
            throw new Exception("البريد الإلكتروني مستخدم بالفعل");
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Customer",
            Phone = request.Phone,
            Governorate = request.Governorate,
            Address = request.Address
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenGenerator.GenerateToken(user);
        var userDto = new UserDto(
            user.Id.ToString(),
            user.FullName,
            user.Email,
            user.Role,
            user.Phone,
            user.Governorate,
            user.Address
        );

        return new AuthResponse(token, userDto);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }

        var token = _tokenGenerator.GenerateToken(user);
        var userDto = new UserDto(
            user.Id.ToString(),
            user.FullName,
            user.Email,
            user.Role,
            user.Phone,
            user.Governorate,
            user.Address
        );

        return new AuthResponse(token, userDto);
    }
}
