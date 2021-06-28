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
All fields are required.
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
All fields are required.
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
Missing functionality: you cannot use an email to get the user.


Real Estate Listings
====================

The routing for real estate listings is found in routes\real-estate-listing-api.js and the controller is found in controllers\real-estate-listing-api.js.

Create Listing
-------------

* Request type: POST
* Path: /listing

### Body Format:

```
{
    title: string,
    address: string,
    price: number,
    city: string,
    owner: string,
    type: either 'residential', 'commercial', or 'industrial'
}
```
All fields are required.


Update Listing
--------------

Not available


Delete Listing from Market
--------------------------

Not available


Delete Listing from Database
----------------------------

* Request type: DELETE
* Path: /listing

### Body Format:

```
{
    id: ObjectId of the listing
}
```
All fields are required.


Get All Listings
----------------

* Request type: GET
* Path: /listings


Get Listings by City
--------------------

* Request type: GET
* Path: /listings/:city

city is a URL parameter.
It is case insensitive.


Get Listings by City and Price Range
------------------------------------

* Request type: GET
* Path: /listings/:city/:min/:max

city is a URL parameter.
It is case insensitive.
min and max are numbers.


Contact
=======

Daniel Di Giovanni - <dannyjdigio@gmail.com>
