-- Insert dummy tags
INSERT INTO tags (name, description) VALUES
('web security', 'Resources related to web application security'),
('network security', 'Resources related to network security'),
('cryptography', 'Resources related to encryption and cryptography'),
('penetration testing', 'Resources related to penetration testing and ethical hacking'),
('ethical hacking', 'Resources related to ethical hacking'),
('malware analysis', 'Resources related to analyzing malware'),
('cloud security', 'Resources related to securing cloud infrastructure'),
('mobile security', 'Resources related to mobile application security'),
('IoT security', 'Resources related to Internet of Things security'),
('OSINT', 'Resources related to Open Source Intelligence'),
('forensics', 'Resources related to digital forensics'),
('CTF', 'Resources related to Capture The Flag competitions'),
('tools', 'Security tools and utilities'),
('education', 'Educational resources for learning security'),
('best practices', 'Security best practices and guidelines'),
('vulnerabilities', 'Information about security vulnerabilities'),
('threat intelligence', 'Resources related to threat intelligence'),
('incident response', 'Resources related to incident response'),
('privacy', 'Resources related to privacy and data protection'),
('authentication', 'Resources related to authentication and authorization')
ON CONFLICT (name) DO NOTHING;

-- Insert dummy resources (replace 'YOUR_USER_ID' with an actual user ID from your auth.users table)
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the first user from the profiles table
    SELECT id INTO user_id FROM profiles LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- Insert resources
        INSERT INTO resources (title, description, url, image_url, user_id, published, featured)
        VALUES
        ('OWASP Top 10 Web Application Security Risks', 
         'The OWASP Top 10 is a standard awareness document for developers and web application security. It represents a broad consensus about the most critical security risks to web applications.',
         'https://owasp.org/www-project-top-ten/',
         'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/owasp-preview-Yx9Oi0QEBHRhGRcIwzfxdJ324BLxfi.png',
         user_id,
         true,
         true),
         
        ('Practical Cryptography for Developers',
         'A modern practical book about cryptography for developers with code examples. The book covers core concepts of cryptography, common cryptographic algorithms and protocols, and their implementation in code with crypto libraries and APIs.',
         'https://cryptobook.nakov.com/',
         'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crypto-preview-Yx9Oi0QEBHRhGRcIwzfxdJ324BLxfi.png',
         user_id,
         true,
         false),
         
        ('Awesome Hacking Resources',
         'A collection of hacking tools, resources and references to practice ethical hacking. This repository is maintained by security professionals and contains links to various resources that are useful for ethical hackers, penetration testers and security researchers.',
         'https://github.com/vitalysim/Awesome-Hacking-Resources',
         'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hacking-preview-Yx9Oi0QEBHRhGRcIwzfxdJ324BLxfi.png',
         user_id,
         true,
         false),
         
        ('Cybersecurity Fundamentals Course',
         'Free online course covering the basics of cybersecurity for beginners. This course introduces key concepts in information security, network security, and cyber defense strategies without requiring prior technical knowledge.',
         'https://www.coursera.org/learn/cybersecurity-fundamentals',
         'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/course-preview-Yx9Oi0QEBHRhGRcIwzfxdJ324BLxfi.png',
         user_id,
         true,
         false),
         
        ('Security Headers Scanner',
         'Analyze HTTP response headers and provide recommendations for improvement. This online tool helps web developers and security professionals assess and enhance the security of their websites by checking for proper implementation of security headers.',
         'https://securityheaders.com/',
         'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/headers-preview-Yx9Oi0QEBHRhGRcIwzfxdJ324BLxfi.png',
         user_id,
         true,
         false);
         
        -- Associate tags with resources
        -- OWASP Top 10
        INSERT INTO resource_tags (resource_id, tag_id)
        SELECT r.id, t.id
        FROM resources r, tags t
        WHERE r.title = 'OWASP Top 10 Web Application Security Risks'
        AND t.name IN ('web security', 'vulnerabilities', 'best practices');
        
        -- Practical Cryptography
        INSERT INTO resource_tags (resource_id, tag_id)
        SELECT r.id, t.id
        FROM resources r, tags t
        WHERE r.title = 'Practical Cryptography for Developers'
        AND t.name IN ('cryptography', 'education', 'tools');
        
        -- Awesome Hacking Resources
        INSERT INTO resource_tags (resource_id, tag_id)
        SELECT r.id, t.id
        FROM resources r, tags t
        WHERE r.title = 'Awesome Hacking Resources'
        AND t.name IN ('ethical hacking', 'penetration testing', 'tools');
        
        -- Cybersecurity Fundamentals
        INSERT INTO resource_tags (resource_id, tag_id)
        SELECT r.id, t.id
        FROM resources r, tags t
        WHERE r.title = 'Cybersecurity Fundamentals Course'
        AND t.name IN ('education', 'best practices', 'network security');
        
        -- Security Headers Scanner
        INSERT INTO resource_tags (resource_id, tag_id)
        SELECT r.id, t.id
        FROM resources r, tags t
        WHERE r.title = 'Security Headers Scanner'
        AND t.name IN ('web security', 'tools', 'best practices');
        
        -- Add some upvotes
        INSERT INTO upvotes (resource_id, user_id)
        SELECT r.id, user_id
        FROM resources r
        WHERE r.title IN ('OWASP Top 10 Web Application Security Risks', 'Awesome Hacking Resources');
    ELSE
        RAISE NOTICE 'No user found in the profiles table. Please create a user first.';
    END IF;
END $$; 