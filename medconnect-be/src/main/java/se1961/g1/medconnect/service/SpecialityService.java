package se1961.g1.medconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se1961.g1.medconnect.pojo.Speciality;
import se1961.g1.medconnect.repository.SpecialityRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SpecialityService {
    @Autowired
    private SpecialityRepository specialityRepository;

    public Optional<Speciality> getSpecialityById(Integer id){
        return specialityRepository.findById(id);
    }

    public List<Speciality> getAllSpecialities(){
        return specialityRepository.findAll();
    }
}
