-- Migration: 007_create_rls_policies
-- Description: Supabase Auth 훅 연동 - 신규 사용자 자동 프로필 생성

-- Auth 사용자 생성 시 users 테이블에 자동 삽입
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 트리거 연결
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 신규 사용자의 기본 오피스 자동 생성
CREATE OR REPLACE FUNCTION handle_new_office_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.offices (user_id, name, theme)
  VALUES (
    NEW.id,
    NEW.display_name || '의 본사',
    'default'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_created_create_office
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_office_for_user();
