# Book Club

# TODOS:

- style BookReview
- style ReviewsPage
- style UsersPage + add logic
    - add people to your book clubs button
- create ClubsPage
- add club logic

# Club DB:
- club_id
- club_name
- description
- users: [user_ids]
- past_books: [book_objects]
- current_book
- deadline
- frequency
- owner?

clubs <-> users is a many-to-many link

# Club Logic:
- users can create book clubs:
    - create form:
        - add friends
        - add name
        - add description
        - set book frequency (once a month? twice a month? etc...)
        - launch book club button
- once launched, the website will choose a member at random to select the book for this period (email notif?). all other memebrs will be notified by email of the new book
- start timer

- in the ClubsPage, users can see their book clubs
- each book club has its own page;
    - page will have the current book, timer, and a ratings/comment section
    - when a new book is chosen, the discussion section will be locked
    - there will be a button saying "i'm finished the book"
    - this wil open a form to an initial review, once completed, you will unlock the comments section

# Other

- start a book club, invite people via email to join the app and be part of your book club
--> idea: you can only get on the site by being invited to a book club??
    - they will receive a link to the site and an access code needed at login?



