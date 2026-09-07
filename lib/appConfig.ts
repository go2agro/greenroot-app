import config from '@/config/appConfig.json'

export function getConfig(key: keyof typeof config) {
  return config[key]
}

export const appConfig = config

export const MAX_FILE_UPLOAD_MB = appConfig.max_file_upload_mb
export const MAX_FILE_UPLOAD_BYTES = MAX_FILE_UPLOAD_MB * 1024 * 1024
export const MAX_FILE_UPLOAD_ERROR = `File must be under ${MAX_FILE_UPLOAD_MB} MB`
export const APPLICATION_STEPS_COUNT = appConfig.application_steps_count
export const ITEMS_PER_PAGE = appConfig.items_per_page
export const MAX_APPLICATIONS_PER_STUDENT = appConfig.max_applications_per_student

export const DEFAULT_INTERNSHIP_IMAGE = appConfig.default_internship_image

export const APP_NAME = appConfig.app_name
export const APP_TAGLINE = appConfig.app_tagline
export const APP_LOGO = appConfig.app_logo

export const INTERNSHIPS_PAGE_HEADING = appConfig.internships_page_heading
export const INTERNSHIPS_PAGE_SUBHEADING = appConfig.internships_page_subheading

export const BTN_APPLY_NOW = appConfig.btn_apply_now
export const BTN_NEXT_STEP = appConfig.btn_next_step
export const BTN_PREV_STEP = appConfig.btn_prev_step
export const BTN_SAVE_DRAFT = appConfig.btn_save_draft
export const BTN_SUBMIT_APPLICATION = appConfig.btn_submit_application
export const BTN_ACCEPT_OFFER = appConfig.btn_accept_offer
export const BTN_WITHDRAW_APPLICATION = appConfig.btn_withdraw_application
export const BTN_VIEW_DETAILS = appConfig.btn_view_details
export const BTN_LOGIN = appConfig.btn_login
export const BTN_SIGNUP = appConfig.btn_signup
export const BTN_CREATE_ACCOUNT = appConfig.btn_create_account
export const BTN_BROWSE_INTERNSHIPS = appConfig.btn_browse_internships
export const BTN_START_BROWSING = appConfig.btn_start_browsing
export const BTN_SEND_RESET_LINK = appConfig.btn_send_reset_link
export const BTN_UPDATE_PASSWORD = appConfig.btn_update_password
export const BTN_BACK_TO_LOGIN = appConfig.btn_back_to_login
export const BTN_LOGIN_TO_APPLY = appConfig.btn_login_to_apply
export const BTN_DECLINE = appConfig.btn_decline
export const BTN_BROWSE_ALL_INTERNSHIPS = appConfig.btn_browse_all_internships
export const BTN_YES_ACCEPT_OFFER = appConfig.btn_yes_accept_offer
export const BTN_SEND_TO_PARTNER = appConfig.btn_send_to_partner
export const BTN_FINAL_APPROVE = appConfig.btn_final_approve
export const BTN_FINAL_REJECT = appConfig.btn_final_reject
export const BTN_SEND_MESSAGE = appConfig.btn_send_message
export const BTN_EXPORT_REPORT = appConfig.btn_export_report
export const BTN_APPROVE_APPLICATION = appConfig.btn_approve_application
export const BTN_REJECT_APPLICATION = appConfig.btn_reject_application
export const BTN_VIEW = appConfig.btn_view
export const BTN_CLEAR_FILTERS = appConfig.btn_clear_filters
export const BTN_LOGOUT = appConfig.btn_logout
export const BTN_CANCEL = appConfig.btn_cancel
export const BTN_CONFIRM = appConfig.btn_confirm
export const BTN_DELETE = appConfig.btn_delete
export const BTN_EDIT = appConfig.btn_edit
export const BTN_SAVE = appConfig.btn_save
export const BTN_REFRESH = appConfig.btn_refresh

export const LABEL_LOADING = appConfig.label_loading
export const LABEL_NO_DATA = appConfig.label_no_data
export const LABEL_NO_RESULTS = appConfig.label_no_results
export const LABEL_SEARCH_PLACEHOLDER = appConfig.label_search_placeholder

export const APP_COLORS = appConfig.colors
export { themeColors } from '@/lib/theme'
