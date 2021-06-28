Introduction
============

This is the code for a RESTful API service built using NodeJS, Express, MongoDB, and some other libraries.
This API offers functionality for user management and real estate listing management.
The body of the HTTP requests were only tested with the format x-www-form-urlencoded.


User Management 
===============

The routing for user management is found in routes\user-management-api.js and the controller is found in controllers\user-management-api.js


User Signup
-----------

* Request type: POST
* Path: /signup

### Body format:
```
{
    username: string,
    password: string,
    email: string (must be an email),
    full_name: string,
    address: string,
    phone_number: number
}
```
All fields are required.
Password is hashed by the bcrypt library before storing.


User Login
----------

* Request type: POST
* Path: /login

### Body Format
```
{
    username: string,
    password: string
}
```
All fields are required.
User authentication handled by passport library.


Change Password
---------------

* Request type: PUT
* Path: /change-password

### Body Format
```
{
    oldPassword: string (must match current password),
    newPassword: string
}
```
Only works is user is logged in (handled by passport library).


Update Profile
--------------

* Request type: PUT
* Path: /update-profile

### Body Format
```
{
    selectedProperty: string (this is the property to be changed; either full_name, phone_number, or address),
    updatedProperty: string (new value of that property)
}
```
Only works is user is logged in (handled by passport library).


Delete User
-----------

* Request type: DELETE
* Path: /delete-user

Only works is user is logged in (handled by passport library).


Get All Users
-------------

* Request type: GET
* Path: /get-all-users


Get User by Username
--------------------

* Request type: GET
* Path: /get-user/:username

username is a URL parameter and should be the username of the specified user.


Contact
=======

Daniel Di Giovanni - <dannyjdigio@gmail.com>
