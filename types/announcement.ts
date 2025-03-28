declare type TAnnouncement = {
    _id:         string;
    attachment:  TAttachment;
    title:       string;
    description: string;
    active:      boolean;
    target:      string;
};
declare type TAttachment = {
    _id:         string;
    filename:    string;
    contentType: string;
    path:        string;
}