using AutoMapper;
using VastgoedAPI.DTOs;
using VastgoedAPI.Models;

namespace VastgoedAPI
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDTO>();

            // Vastgoed mappings
            CreateMap<Vastgoed, VastgoedDTO>()
                .ForMember(dest => dest.VerhuurderNaam, opt => opt.MapFrom(src => src.Verhuurder != null ? src.Verhuurder.Naam : string.Empty));
            CreateMap<VastgoedCreateDTO, Vastgoed>();
            CreateMap<Vastgoed, VastgoedDetailDTO>()
                .ForMember(dest => dest.VerhuurderNaam, opt => opt.MapFrom(src => src.Verhuurder != null ? src.Verhuurder.Naam : string.Empty));

            // Huurder mappings
            CreateMap<Huurder, HuurderDTO>();
            CreateMap<HuurderCreateDTO, Huurder>();
            CreateMap<Huurder, HuurderDetailDTO>();

            // Verhuurder mappings
            CreateMap<Verhuurder, VerhuurderDTO>();
            CreateMap<VerhuurderCreateDTO, Verhuurder>();
            CreateMap<Verhuurder, VerhuurderDetailDTO>();

            // Contract mappings
            CreateMap<ContractCreateDTO, Contract>();
            CreateMap<Contract, ContractDTO>()
                .ForMember(dest => dest.VastgoedNaam, opt => opt.MapFrom(src => src.Vastgoed != null ? src.Vastgoed.Naam : string.Empty))
                .ForMember(dest => dest.HuurderNaam, opt => opt.MapFrom(src => src.Huurder != null ? src.Huurder.Naam : string.Empty))
                .ForMember(dest => dest.VerhuurderID, opt => opt.MapFrom(src => src.Vastgoed != null ? src.Vastgoed.VerhuurderID : 0));

            // Transactie mappings
            CreateMap<Transactie, TransactieDTO>()
                .ForMember(dest => dest.VastgoedNaam, opt => opt.MapFrom(src => src.Vastgoed != null ? src.Vastgoed.Naam : string.Empty));
            CreateMap<TransactieCreateDTO, Transactie>();
        }
    }
}