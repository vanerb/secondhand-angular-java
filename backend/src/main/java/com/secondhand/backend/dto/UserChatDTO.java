package com.secondhand.backend.dto;


import com.secondhand.backend.entity.User;

public class UserChatDTO {

    private Long id;
    private String username;
    private String name;
    private String cogname;
    private String profileImage;

    public UserChatDTO() {
    }

    public UserChatDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.name = user.getName();
        this.cogname = user.getCogname();
        this.profileImage = user.getProfileImage();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getCogname() {
        return cogname;
    }

    public String getProfileImage() {
        return profileImage;
    }
}
